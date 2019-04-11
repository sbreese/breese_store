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