import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';

import { useCheckoutContext } from './context';
import { CheckoutSummary } from './checkout-summary';
import { CheckoutCartProductList } from './checkout-cart-product-list';

// ----------------------------------------------------------------------

export function CheckoutCart() {
  const checkout = useCheckoutContext();

  const empty = !checkout.items.length;

  // Get the continue shopping path based on current URL
  const getContinueShoppingPath = () => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const storeIdMatch = pathname.match(/\/stores\/([^\/]+)\/checkout/);
      if (storeIdMatch) {
        return `/stores/${storeIdMatch[1]}`;
      }
    }
    return paths.product.root;
  };

  return (
    <Grid container spacing={{ xs: 2, sm: 3 }}>
      <Grid xs={12} md={8}>
        <Card sx={{ mb: { xs: 2, sm: 3 } }}>
          <CardHeader
            title={
              <Typography variant="h6" sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}>
                Cart
                <Typography 
                  component="span" 
                  sx={{ 
                    color: 'text.secondary',
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                >
                  &nbsp;(
                  {checkout.totalItems} item{checkout.totalItems !== 1 ? 's' : ''})
                </Typography>
              </Typography>
            }
            sx={{ mb: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}
          />

          {empty ? (
            <EmptyContent
              title="Cart is empty!"
              description="Look like you have no items in your shopping cart."
              imgUrl={`${CONFIG.site.basePath}/assets/icons/empty/ic-cart.svg`}
              sx={{ pt: 5, pb: 10 }}
            />
          ) : (
            <CheckoutCartProductList
              products={checkout.items}
              onDelete={checkout.onDeleteCart}
              onIncreaseQuantity={checkout.onIncreaseQuantity}
              onDecreaseQuantity={checkout.onDecreaseQuantity}
              onUpdateVariant={checkout.onUpdateVariant}
            />
          )}
        </Card>

        <Button
          component={RouterLink}
          href={getContinueShoppingPath()}
          color="inherit"
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          sx={{ 
            fontSize: { xs: '0.875rem', sm: '1rem' },
            px: { xs: 2, sm: 3 }
          }}
        >
          Continue shopping
        </Button>
      </Grid>

      <Grid xs={12} md={4}>
        <CheckoutSummary
          total={checkout.total}
          discount={checkout.discount}
          subtotal={checkout.subtotal}
          onApplyDiscount={checkout.onApplyDiscount}
        />

        <Button
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          disabled={empty}
          onClick={checkout.onNextStep}
          sx={{
            py: { xs: 1.5, sm: 2 },
            fontSize: { xs: '1rem', sm: '1.125rem' },
            fontWeight: 600
          }}
        >
          Check out
        </Button>
      </Grid>
    </Grid>
  );
}