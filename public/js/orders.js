/**
 * Helper functions
 */
const hasClass = (el, className) => {
  if (el.classList)
      return el.classList.contains(className);
  return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
}

const addClass = (el, className) => {
    if (el.classList)
        el.classList.add(className)
    else if (!hasClass(el, className))
        el.className += " " + className;
}

/**
 * Button actions
 */
const deleteOrder = btn => {
    const orderId = btn.parentNode.querySelector('[name=orderId]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
  
    const orderElement = btn.closest('.user_row');

    fetch(`/admin/order/${orderId}`, {
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
        // addClass(orderElement, 'green');
        if (orderElement) {
          orderElement.classList.add('green');
        } else {
          // applies to order-detail page:
          const list = document.querySelectorAll("td.order_row");
          for (var i = 0; i < list.length; ++i) {
            list[i].classList.add('green');
            list[i].textContent = 'Shipped';
          }
        }
      })
      .catch(err => {
        console.log(err);
      });
  };