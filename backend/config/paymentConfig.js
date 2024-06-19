const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;
const base = "https://api-m.sandbox.paypal.com";

const createOrder = async (cart) => {
    const { totalprice, address_line_1, address_line_2, admin_area_2, admin_area_1, postal, country,} = cart;
    // console.log(cart, totalprice);

    const accessToken = await generatePaypalAccessToken();
    const url = `${base}/v2/checkout/orders`;
    const payload = {
        intent: "CAPTURE",
        purchase_units: [
            {
                amount: {
                    currency_code: "USD",
                    value: totalprice,
                },
                shipping: {
                    name: {
                        full_name: "John Doe"
                    },
                    address: {
                        address_line_1,
                        address_line_2,
                        admin_area_2,
                        admin_area_1,
                        postal_code: postal,
                        country_code: country,
                    }
                }
            }
        ]
    }
    const checkout = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
    });

    return handleResponse(checkout);
};

const caputureOrder = async (orderID) => {
    const accessToken = await generatePaypalAccessToken();
    const url = `${base}/v2/checkout/orders/${orderID}/capture`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        }
    });
    return handleResponse(response);
}

// Function to generate paypal accessToken
const generatePaypalAccessToken = async () => {
    try {
        if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
            throw new Error("PayPal credentials are missing.")
        };
        const auth = Buffer.from(
            PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET
        ).toString("base64");
        const response = await fetch(`${base}/v1/oauth2/token`, {
            method: "POST",
            body: "grant_type=client_credentials",
            headers: {
                Authorization: `Basic ${auth}`,
            },
        });
        const oauthResponse = await response.json();
        // console.log("Successfully generate Access Token:");

        return oauthResponse.access_token;
    } catch (error) {
        console.error("Failed to generate Access Token:", error);
    }
};

// Function to handel response
const handleResponse = async (response) => {
    try {
        const jsonResponse = await response.json();
        // console.log("Handel response: ", jsonResponse);
        return {
            jsonResponse,
            StatusCode: response.status,
        };
    } catch (error) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
    }
};

export {
    createOrder,
    caputureOrder
}