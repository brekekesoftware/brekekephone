import Swal from 'sweetalert2/dist/sweetalert2';
import 'sweetalert2/dist/sweetalert2.css';

export default {
  // Only support [cancelBtn, okBtn]
  alert: (title, text, [cancelBtn, okBtn], config) => {
    Swal.fire({
      title,
      text,
      showCancelButton: true,
      confirmButtonText: okBtn.text,
      cancelButtonText: cancelBtn.text,
    }).then(res => {
      if (res.value) {
        okBtn.onPress();
      } else {
        cancelBtn.onPress();
      }
    });
  },
};
