
const deleteUser = btn => {
    const orderId = btn.parentNode.querySelector('[name=orderId]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
  
    const orderElement = btn.closest('.user_row');
  
    fetch('/admin/user/' + orderId, {
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
