import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const CheckoutForm = ({ clientSecret, onPaymentSuccess, onPaymentError, totalAmount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const cardStyle = {
    style: {
      base: {
        color: '#1e293b',
        fontFamily: '"Outfit", sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        fontWeight: '500',
        '::placeholder': {
          color: '#94a3b8',
        },
        padding: '12px',
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });

    if (error) {
      setErrorMessage(error.message);
      onPaymentError && onPaymentError(error.message);
      setIsProcessing(false);
    } else {
      if (paymentIntent.status === 'succeeded') {
        onPaymentSuccess && onPaymentSuccess(paymentIntent);
        setIsProcessing(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="pf-checkout-form">
      <div className="pf-payment-row">
        <label htmlFor="card-element">Card Details</label>
        <div id="card-element" className="pf-stripe-card-container">
          <CardElement options={cardStyle} />
        </div>
      </div>
      
      {errorMessage && <div className="pf-error-alert">{errorMessage}</div>}
      
      <button 
        className="pf-nav-button pf-w-full pf-mt-lg" 
        disabled={isProcessing || !stripe}
        type="submit"
      >
        {isProcessing ? 'Processing Payment...' : `Complete Payment (₹${totalAmount})`}
      </button>
      
      <p className="pf-payment-security-text">
        🔒 Your payment is secured and encrypted via Stripe.
      </p>
    </form>
  );
};

export default CheckoutForm;
