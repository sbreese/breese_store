// usage: helper.formatter.format(total)
exports.formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
});

// usage: helper.sumPropertyValue(items, 'quantity')
exports.sumPropertyValue = (items, prop) => items.reduce((a, b) => a + b[prop], 0);

exports.calcTotalPrice = cart_items => {
    let total = 0;
    cart_items.forEach(p => {
        total += p.quantity * p.product.price;
    });
    return this.formatter.format(total);
}

exports.formatResultInfo = (param_1_value, ITEMS_PER_PAGE, totalItems, page) => {
    return param_1_value && `<span>${(ITEMS_PER_PAGE < totalItems ? `${(page - 1) * ITEMS_PER_PAGE + 1}-${ITEMS_PER_PAGE} of ` : '' ) + `${totalItems} result` + (totalItems > 1 ? 's' : '') + (param_1_value ? ` for </span><span> </span><span class="a-color-state a-text-bold"><q>${param_1_value}</q></span>` : '</span>')}`;
}