'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import { invoicesApi } from 'src/services/invoicesService';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { InvoiceNewEditForm } from 'src/sections/invoice/invoice-new-edit-form';

// ----------------------------------------------------------------------

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        setLoading(true);
        const invoiceData = await invoicesApi.getInvoiceById(id);
        
        if (!invoiceData) {
          toast.error('Invoice not found');
          router.push(paths.dashboard.invoice.root);
          return;
        }

        // Transform database data to match form format
        const transformedInvoice = {
          id: invoiceData.id,
          invoiceNumber: invoiceData.invoice_number,
          createDate: invoiceData.invoice_date,
          dueDate: invoiceData.due_date,
          status: invoiceData.status,
          sent: invoiceData.sent || 0,
          invoiceFrom: {
            name: invoiceData.invoice_from_name,
            address: invoiceData.invoice_from_address,
            company: invoiceData.invoice_from_company,
            email: invoiceData.invoice_from_email,
            phone: invoiceData.invoice_from_phone,
          },
          invoiceTo: {
            name: invoiceData.invoice_to_name,
            address: invoiceData.invoice_to_address,
            company: invoiceData.invoice_to_company,
            email: invoiceData.invoice_to_email,
            phone: invoiceData.invoice_to_phone,
          },
          items: (invoiceData.invoice_items || []).map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            service: item.service,
            quantity: item.quantity,
            price: parseFloat(item.unit_price || 0),
            total: parseFloat(item.total || 0),
          })),
          subtotal: parseFloat(invoiceData.subtotal || 0),
          shipping: parseFloat(invoiceData.shipping || 0),
          discount: parseFloat(invoiceData.discount || 0),
          taxes: parseFloat(invoiceData.taxes || 0),
          totalAmount: parseFloat(invoiceData.total_amount || 0),
          notes: invoiceData.notes,
          supportEmail: invoiceData.support_email,
        };

        setInvoice(transformedInvoice);
        document.title = `Edit ${transformedInvoice.invoiceNumber} | Invoice - STUDIO360`;
      } catch (error) {
        console.error('Error loading invoice:', error);
        toast.error('Failed to load invoice');
        router.push(paths.dashboard.invoice.root);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadInvoice();
    }
  }, [id, router]);

  if (loading) {
    return (
      <DashboardContent>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  if (!invoice) {
    return (
      <DashboardContent>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Invoice not found
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            The invoice you're looking for doesn't exist or has been removed.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={() => router.push(paths.dashboard.invoice.root)}
          >
            Back to Invoices
          </Button>
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit Invoice"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Invoice', href: paths.dashboard.invoice.root },
          { name: invoice.invoiceNumber },
          { name: 'Edit' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <InvoiceNewEditForm currentInvoice={invoice} />
    </DashboardContent>
  );
}
