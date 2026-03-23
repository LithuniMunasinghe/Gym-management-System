using Stripe;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using WebApplication1.Models;
using Stripe;
namespace WebApplication1.BusinessLayer
{
    public class PaymentGatewayManager
    {
        public PaymentGatewayManager()
        {
            // Set your Secret Key from Stripe Dashboard
            StripeConfiguration.ApiKey = "sk_test_your_key_here";
        }

        public string CreateCheckoutSession(PaymentModel model, string successUrl, string cancelUrl)
        {
            var options = new Stripe.Checkout.SessionCreateOptions
            {
                PaymentMethodTypes = new System.Collections.Generic.List<string> { "card" },
                LineItems = new System.Collections.Generic.List<Stripe.Checkout.SessionLineItemOptions>
                {
                    new Stripe.Checkout.SessionLineItemOptions
                    {
                        PriceData = new Stripe.Checkout.SessionLineItemPriceDataOptions
                        {
                            UnitAmount = (long)(decimal.Parse(model.paymentAmount) * 100), // Stripe uses cents
                            Currency = "usd",
                            ProductData = new Stripe.Checkout.SessionLineItemPriceDataProductDataOptions
                            {
                                Name = $"Subscription for ID: {model.subscriptionId}",
                            },
                        },
                        Quantity = 1,
                    },
                },
                Mode = "payment",
                SuccessUrl = successUrl,
                CancelUrl = cancelUrl,
                ClientReferenceId = model.subscriptionId // Link to your DB record
            };

            var service = new Stripe.Checkout.SessionService();
            var session = service.Create(options);
            return session.Url; // This is where you redirect the user
        }
    }
}