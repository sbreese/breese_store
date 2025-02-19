/**
 * Helper functions
 */
const hasClass = (el, className) => {
  if (el.classList)
      return el.classList.contains(className);
  return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
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
        if (orderElement) {
          orderElement.parentNode.removeChild(orderElement);
        } else {
          window.location.href = '/admin/orders';
        }
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
        if (orderElement) {
          if (hasClass(orderElement, 'green')) {
            orderElement.classList.remove("green");
            btn.textContent = "Shipped";
          } else {
            orderElement.classList.add('green');
            btn.textContent = "Unship";
          }
          
        } else {
          // applies to order-detail page:
          const list = document.querySelectorAll("td.order_row");
          for (var i = 0; i < list.length; ++i) {

            if (hasClass(list[i], 'green')) {
              list[i].classList.remove("green");
              list[i].textContent = 'NOT shipped';
              btn.textContent = "Shipped";
            } else {
              list[i].classList.add('green');
              list[i].textContent = 'Shipped';
              btn.textContent = "Unship";
            }
          }
        }
      })
      .catch(err => {
        console.log(err);
      });
  };