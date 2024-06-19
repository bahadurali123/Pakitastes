// Handel shipping address input and validataion
let address_line_1, address_line_2, admin_area_2, admin_area_1, postal, country;
const subbtn = document.getElementById("address-btn");
// console.log("Data is this:", address_line_1, address_line_2, admin_area_2, admin_area_1, postal, country, subbtn);
subbtn.addEventListener("click", validataion);
function validataion() {
    const addline1 = document.getElementById("addline1").value;
    const addline2 = document.getElementById("addline2").value;
    const admarea2 = document.getElementById("admarea2").value;
    const admarea1 = document.getElementById("admarea1").value;
    const post = document.getElementById("postal").value;
    const contry = document.getElementById("country").value;
    if (addline1 === "" || addline1.length < 5) {
        return resultMessage("Addres Line 1 is incorrect");
    };
    if (addline2 === "" || addline2.length < 5) {
        return resultMessage("Address Line 2 is incorrect");
    };
    if (admarea2 === "" || !isNaN(admarea2) || admarea2.length < 5 || admarea2.length > 20) {
        return resultMessage("City is incorrect");
    };
    if (admarea1 === "" || !isNaN(admarea1) || admarea1.length < 5 || admarea1.length > 20) {
        return resultMessage("State is incorrect");
    };
    if (post === "" || isNaN(post) || post.length < 4 || post.length > 6) {
        return resultMessage("Postal code is incorrect");
    };
    if (contry === "" || !isNaN(contry) || !(contry.length === 2)) {
        return resultMessage("Country name is incorrect");
    };
    address_line_1 = addline1;
    address_line_2 = addline2;
    admin_area_2 = admarea2;
    admin_area_1 = admarea1;
    postal = post;
    country = contry;
};

// Deal with paypal buttons
window.paypal
    .Buttons({
        async createOrder() {
            try {
                console.log(`Name:${address_line_1} Street:${address_line_2} City:${admin_area_2} State:${admin_area_1} Postal: ${postal} Country:${country}`);
                const response = await fetch("/bahadur/v1/paypal/order", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    // use the "body" param to optionally pass additional order information
                    // like product ids and quantities
                    body: JSON.stringify({
                        address_line_1,
                        address_line_2,
                        admin_area_2,
                        admin_area_1,
                        postal,
                        country,
                    }),
                });

                const orderData = await response.json();
                console.log('1: response data of api orders', orderData);
                if (orderData.id) {
                    return orderData.id;
                } else {
                    const errorDetail = orderData?.details?.[0];
                    const errorMessage = errorDetail
                        ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                        : JSON.stringify(orderData);

                    throw new Error(errorMessage);
                }
            } catch (error) {
                console.error(error);
                resultMessage(`Could not initiate PayPal Checkout...<br><br>${error}`);
            }
        },
        async onApprove(data, actions) {
            try {
                console.log("onApprove: ", data, ":", actions);
                const response = await fetch(`/bahadur/v1/paypal/order/${data.orderID}/capture`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                const orderData = await response.json();
                console.log('2: response data of api ordersID capture', orderData);
                //     // Three cases to handle:
                //     //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
                //     //   (2) Other non-recoverable errors -> Show a failure message
                //     //   (3) Successful transaction -> Show confirmation or thank you message

                //     const errorDetail = orderData?.details?.[0];

                //     if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
                //       // (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
                //       // recoverable state, per https://developer.paypal.com/docs/checkout/standard/customize/handle-funding-failures/
                //       return actions.restart();
                //     } else if (errorDetail) {
                //       // (2) Other non-recoverable errors -> Show a failure message
                //       throw new Error(`${errorDetail.description} (${orderData.debug_id})`);
                //     } else if (!orderData.purchase_units) {
                //       throw new Error(JSON.stringify(orderData));
                //     } else {
                //       // (3) Successful transaction -> Show confirmation or thank you message
                //       // Or go to another URL:  actions.redirect('thank_you.html');
                //       const transaction =
                //         orderData?.purchase_units?.[0]?.payments?.captures?.[0] ||
                //         orderData?.purchase_units?.[0]?.payments?.authorizations?.[0];
                //       resultMessage(
                //         `Transaction ${transaction.status}: ${transaction.id}<br><br>See console for all available details`,
                //       );
                //       console.log(
                //         "Capture result",
                //         orderData,
                //         JSON.stringify(orderData, null, 2),
                //       );
                //     }
            } catch (error) {
                console.error(error);
                resultMessage(
                    `Sorry, your transaction could not be processed...<br><br>${error}`,
                );
            }
        },
    })
    .render("#paypal-button-container");

// // Example function to show a result to the user. Your site's UI library can be used instead.
function resultMessage(message) {
    const container = document.querySelector("#result-message");
    container.innerHTML = message;
}