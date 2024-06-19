const handelPayments = (paypalFee, netAmount, amount, totalPrice, receivableAmount) => {
    const paypalFeePercentage = paypalFee / amount * 100;
    const netAmountPercentage = netAmount / amount * 100;
    const paypalFeeIs = parseFloat((totalPrice / 100 * paypalFeePercentage).toFixed(2));
    const netAmountIs = parseFloat((totalPrice / 100 * netAmountPercentage).toFixed(2));
    const exchangeAmountIs = parseFloat((netAmountIs * (receivableAmount / netAmount)).toFixed(2));

    return {
        paypalFeeIs,
        netAmountIs,
        exchangeAmountIs
    }
}

export { handelPayments };