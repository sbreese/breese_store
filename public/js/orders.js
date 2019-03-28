function addClass(el, className)
{
    if (el.classList)
        el.classList.add(className)
    else if (!hasClass(el, className))
        el.className += " " + className;
}

const deleteOrder = btn => {
    const orderId = btn.parentNode.querySelector('[name=orderId]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
  
    const orderElement = btn.closest('.user_row');
  
    fetch('/admin/order/' + orderId, {
      method: 'DELETE',
      headers: {
        'csrf-token': csrf
      }
    })
      .then(result => {
        return result.json();
      })
      .then(data => {
        console.log(data);
        orderElement.parentNode.removeChild(orderElement);
      })
      .catch(err => {
        console.log(err);
      });
  };
  
  const shippedOrder = btn => {
    const orderId = btn.parentNode.querySelector('[name=orderId]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
  
    const orderElement = btn.closest('.order_row');
  
    fetch('/admin/order/' + orderId, {
      method: 'PATCH',
      headers: {
        'csrf-token': csrf
      }
    })
      .then(result => {
        return result.json();
      })
      .then(data => {
        console.log(data);
        // orderElement.style.background = 'green';
        addClass(orderElement, 'green');
      })
      .catch(err => {
        console.log(err);
      });
  };