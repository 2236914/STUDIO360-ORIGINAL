import { useMemo } from 'react';
import { useForm } from 'react-hook-form';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { today } from 'src/utils/format-time';

// Mock data - replace with your actual data source
const _addressBooks = [
  {
    id: '1',
    name: 'Jayvion Simon',
    fullAddress: '19034 Verna Unions Apt. 164-Honolulu, RI / 87535',
    phoneNumber: '+1 202-555-0143',
  },
  {
    id: '2',
    name: 'Lucian Obrien',
    fullAddress: '1147 Rohan Drive Suite 819 - Burlington, VT / 82021',
    phoneNumber: '+1 416-555-0198',
  },
  {
    id: '3',
    name: 'Deja Brady',
    fullAddress: '18605 Thompson Circle Apt. 086 - Idaho Falls, WV / 50337',
    phoneNumber: '+44 20 7946 0958',
  },
];

const INVOICE_SERVICE_OPTIONS = [
  { id: 1, name: 'CEO', price: 100 },
  { id: 2, name: 'CTO', price: 150 },
  { id: 3, name: 'Project Coordinator', price: 80 },
  { id: 4, name: 'Designer', price: 120 },
  { id: 5, name: 'Developer', price: 200 },
];

// ----------------------------------------------------------------------

export function InvoiceNewEditForm({ currentInvoice }) {
  const router = useRouter();

  const loadingSave = useBoolean();

  const loadingSend = useBoolean();

  const defaultValues = useMemo(
    () => ({
      invoiceNumber: currentInvoice?.invoiceNumber || 'INV-1990',
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
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      loadingSave.onFalse();
      router.push(paths.dashboard.invoice.root);
      console.info('DATA', JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(error);
      loadingSave.onFalse();
    }
  });

  const handleCreateAndSend = handleSubmit(async (data) => {
    loadingSend.onTrue();

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      loadingSend.onFalse();
      router.push(paths.dashboard.invoice.root);
      console.info('DATA', JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(error);
      loadingSend.onFalse();
    }
  });

  return (
    <form>
      <Card>
        <InvoiceNewEditAddress methods={methods} addressBooks={_addressBooks} />

        <InvoiceNewEditStatusDate methods={methods} />

        <InvoiceNewEditDetails methods={methods} serviceOptions={INVOICE_SERVICE_OPTIONS} />
      </Card>

      <Stack justifyContent="flex-end" direction="row" spacing={2} sx={{ mt: 3 }}>
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
  );
}
