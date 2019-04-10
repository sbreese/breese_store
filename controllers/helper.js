// usage: this.formatter.format(total)
exports.formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
});

exports.calcTotalPrice = cart_items => {
    let total = 0;
    cart_items.forEach(p => {
        total += p.quantity * p.product.price;
    });
    return this.formatter.format(total);
}