
const deleteUser = btn => {
    const userId = btn.parentNode.querySelector('[name=userId]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
  
    const userElement = btn.closest('.user_row');
  
    fetch('/admin/user/' + userId, {
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
        userElement.parentNode.removeChild(userElement);
      })
      .catch(err => {
        console.log(err);
      });
  };
