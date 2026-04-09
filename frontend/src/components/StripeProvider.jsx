import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// The publishable key should ideally come from backend or env, 
// but we'll use the one returned by the create-payment-intent API for flexibility.
const StripeProvider = ({ children, publishableKey }) => {
  if (!publishableKey) return <div className="loading-spinner">Initializing Payment...</div>;
  
  const stripePromise = loadStripe(publishableKey);

  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
};

export default StripeProvider;
