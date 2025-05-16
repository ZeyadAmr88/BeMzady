/**
 * Stripe payment handler utility
 * This file contains functions to handle Stripe redirect and success
 */

/**
 * Checks if the current URL contains Stripe success parameters and redirects to the order success page
 * This function should be called when components mount to check for redirects from Stripe
 */
export const checkStripeRedirect = () => {
    try {
        const urlParams = new URLSearchParams(window.location.search);

        // Check different possible success indicators from Stripe
        const hasPaymentIntent = urlParams.get('payment_intent');
        const hasRedirectStatus = urlParams.get('redirect_status') === 'succeeded';
        const hasSessionID = urlParams.get('session_id');

        // Check if we have an error or cancellation
        const hasError = urlParams.get('error') || urlParams.get('canceled') === 'true';

        // If session_id exists, it's a return from Stripe Checkout
        // If payment_intent and redirect_status=succeeded exist, it's a return from Payment Intent
        const isStripeSuccess = (hasPaymentIntent && hasRedirectStatus) || hasSessionID;

        if (isStripeSuccess) {
            // Clean up the URL by removing query parameters before redirecting
            try {
                window.history.replaceState({}, document.title, window.location.pathname);
            } catch (historyError) {
                console.warn("Could not clean URL parameters:", historyError);
                // Continue even if we can't clean the URL
            }

            // Redirect to the payment success page
            window.location.href = '/payment/success';
            return true;
        } else if (hasError || (urlParams.get('redirect_status') === 'failed')) {
            // If there was an error in the payment, redirect to failure page
            // Store error details if any
            try {
                const errorMessage = urlParams.get('error_message') || "Payment was not completed";
                const errorCode = urlParams.get('error_code') || "";

                // Save error details to session storage for the failure page
                sessionStorage.setItem('stripe_error', JSON.stringify({
                    message: errorMessage,
                    code: errorCode
                }));
            } catch (e) {
                console.warn("Could not store error details:", e);
            }

            // Redirect to failure page
            window.location.href = '/payment/fail';
            return true;
        }
    } catch (error) {
        console.error("Error handling Stripe redirect:", error);
        // If there's an error in the redirect handling, we'll still try to redirect to success
        // This helps when Stripe's page has issues but our customer has actually paid
        if (window.location.href.includes('stripe.com') ||
            window.location.search.includes('payment_intent') ||
            window.location.search.includes('session_id')) {

            // If the URL contains 'canceled' or 'error', redirect to failure
            if (window.location.search.includes('canceled=true') ||
                window.location.search.includes('error')) {
                window.location.href = '/payment/fail';
            } else {
                window.location.href = '/payment/success';
            }
            return true;
        }
    }

    return false;
};

/**
 * Helper function to add Stripe success handling to existing payment flows
 * @param {string} paymentUrl - The Stripe payment URL
 * @param {Function} [onSuccess] - Optional callback function to run before redirect
 */
export const redirectToStripePayment = (paymentUrl, onSuccess) => {
    if (!paymentUrl) {
        console.warn("No payment URL provided");
        return false;
    }

    try {
        // Run optional success callback before redirect
        if (typeof onSuccess === 'function') {
            onSuccess();
        }

        // Instead of modifying the URL (which can cause issues), just use it as is
        // Stripe handles the return URL on their side
        window.location.href = paymentUrl;
        return true;
    } catch (error) {
        console.error("Error redirecting to payment URL:", error);
        return false;
    }
}; 