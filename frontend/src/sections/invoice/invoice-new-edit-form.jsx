import { useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { today } from 'src/utils/format-time';

import { invoicesApi } from 'src/services/invoicesService';

import { toast } from 'src/components/snackbar';

import { InvoiceNewEditAddress } from './invoice-new-edit-address';
import { InvoiceNewEditStatusDate } from './invoice-new-edit-status-date';
import { InvoiceNewEditDetails } from './invoice-new-edit-details';
import { InvoiceNewEditNotesSupport } from './invoice-new-edit-notes-support';

// Address books data - populated from existing invoices
const _addressBooks = [];

const INVOICE_SERVICE_OPTIONS = [
  { id: 1, name: 'CEO', price: 100 },
  { id: 2, name: 'CTO', price: 150 },
  { id: 3, name: 'Project Coordinator', price: 80 },
  { id: 4, name: 'Designer', price: 120 },
  { id: 5, name: 'Developer', price: 200 },
];

// ----------------------------------------------------------------------

export function InvoiceNewEditForm({ currentInvoice, onClose, onSuccess }) {
  const router = useRouter();

  const loadingSave = useBoolean();

  const loadingSend = useBoolean();

  const defaultValues = useMemo(
    () => ({
      invoiceNumber: currentInvoice?.invoiceNumber || '',
      createDate: currentInvoice?.createDate || today(),
      dueDate: currentInvoice?.dueDate || null,
      taxes: currentInvoice?.taxes || 0,
      shipping: currentInvoice?.shipping || 0,
      status: currentInvoice?.status || 'draft',
      discount: currentInvoice?.discount || 0,
      invoiceFrom: currentInvoice?.invoiceFrom || _addressBooks[0],
      invoiceTo: currentInvoice?.invoiceTo || null,
      totalAmount: currentInvoice?.totalAmount || 0,
      items: currentInvoice?.items || [
        {
          title: '',
          description: '',
          service: '',
          quantity: 1,
          price: 0,
          total: 0,
        },
      ],
      notes: currentInvoice?.notes || '',
      supportEmail: currentInvoice?.supportEmail || '',
    }),
    [currentInvoice]
  );

  const methods = useForm({
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const handleSaveAsDraft = handleSubmit(async (data) => {
    loadingSave.onTrue();

    try {
      // Prepare invoice data for API
      const invoiceData = {
        invoice_number: data.invoiceNumber,
        invoice_date: data.createDate,
        due_date: data.dueDate,
        status: 'draft',
        invoice_from_name: data.invoiceFrom?.name || '',
        invoice_from_company: data.invoiceFrom?.company || '',
        invoice_from_address: data.invoiceFrom?.address || '',
        invoice_from_phone: data.invoiceFrom?.phone || '',
        invoice_from_email: data.invoiceFrom?.email || '',
        invoice_to_name: data.invoiceTo?.name || '',
        invoice_to_company: data.invoiceTo?.company || '',
        invoice_to_address: data.invoiceTo?.address || '',
        invoice_to_phone: data.invoiceTo?.phone || '',
        invoice_to_email: data.invoiceTo?.email || '',
        subtotal: data.items.reduce((sum, item) => sum + (item.total || 0), 0),
        shipping: data.shipping || 0,
        discount: data.discount || 0,
        taxes: data.taxes || 0,
        total_amount: data.totalAmount || 0,
        items: data.items.map(item => ({
          title: item.title,
          description: item.description,
          service: item.service,
          quantity: item.quantity,
          unit_price: item.price,
          total: item.total,
        })),
        notes: data.notes || '',
        support_email: data.supportEmail || '',
      };

      if (currentInvoice) {
        // Update existing invoice
        await invoicesApi.updateInvoice(currentInvoice.id, invoiceData);
        toast.success('Invoice updated successfully!');
      } else {
        // Create new invoice
        await invoicesApi.createInvoice(invoiceData);
        toast.success('Invoice saved as draft!');
      }

      reset();
      loadingSave.onFalse();
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(paths.dashboard.invoice.root);
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error(currentInvoice ? 'Failed to update invoice' : 'Failed to create invoice');
      loadingSave.onFalse();
    }
  });

  const handleCreateAndSend = handleSubmit(async (data) => {
    loadingSend.onTrue();

    try {
      // Prepare invoice data for API
      const invoiceData = {
        invoice_number: data.invoiceNumber,
        invoice_date: data.createDate,
        due_date: data.dueDate,
        status: 'pending', // Set to pending when sending
        invoice_from_name: data.invoiceFrom?.name || '',
        invoice_from_company: data.invoiceFrom?.company || '',
        invoice_from_address: data.invoiceFrom?.address || '',
        invoice_from_phone: data.invoiceFrom?.phone || '',
        invoice_from_email: data.invoiceFrom?.email || '',
        invoice_to_name: data.invoiceTo?.name || '',
        invoice_to_company: data.invoiceTo?.company || '',
        invoice_to_address: data.invoiceTo?.address || '',
        invoice_to_phone: data.invoiceTo?.phone || '',
        invoice_to_email: data.invoiceTo?.email || '',
        subtotal: data.items.reduce((sum, item) => sum + (item.total || 0), 0),
        shipping: data.shipping || 0,
        discount: data.discount || 0,
        taxes: data.taxes || 0,
        total_amount: data.totalAmount || 0,
        sent: 1, // Mark as sent once
        items: data.items.map(item => ({
          title: item.title,
          description: item.description,
          service: item.service,
          quantity: item.quantity,
          unit_price: item.price,
          total: item.total,
        })),
        notes: data.notes || '',
        support_email: data.supportEmail || '',
      };

      if (currentInvoice) {
        // Update existing invoice and mark as sent
        await invoicesApi.updateInvoice(currentInvoice.id, invoiceData);
        await invoicesApi.markInvoiceAsSent(currentInvoice.id);
        toast.success('Invoice updated and sent successfully!');
      } else {
        // Create new invoice
        const newInvoice = await invoicesApi.createInvoice(invoiceData);
        if (newInvoice) {
          await invoicesApi.markInvoiceAsSent(newInvoice.id);
        }
        toast.success('Invoice created and sent successfully!');
      }

      reset();
      loadingSend.onFalse();
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(paths.dashboard.invoice.root);
      }
    } catch (error) {
      console.error('Error creating/sending invoice:', error);
      toast.error('Failed to create and send invoice');
      loadingSend.onFalse();
    }
  });

  return (
    <FormProvider {...methods}>
      <form>
        <Card>
          <InvoiceNewEditAddress methods={methods} addressBooks={_addressBooks} />

          <InvoiceNewEditStatusDate methods={methods} />

          <InvoiceNewEditDetails methods={methods} serviceOptions={INVOICE_SERVICE_OPTIONS} />

          <InvoiceNewEditNotesSupport methods={methods} />
        </Card>

        <Stack justifyContent="flex-end" direction="row" spacing={2} sx={{ mt: 3, mb: 6 }}>
          <LoadingButton
            color="inherit"
            size="large"
            variant="outlined"
            loading={loadingSave.value && isSubmitting}
            onClick={handleSaveAsDraft}
          >
            Save as draft
          </LoadingButton>

          <LoadingButton
            size="large"
            variant="contained"
            loading={loadingSend.value && isSubmitting}
            onClick={handleCreateAndSend}
          >
            {currentInvoice ? 'Update' : 'Create'} & send
          </LoadingButton>
        </Stack>
      </form>
    </FormProvider>
  );
}
