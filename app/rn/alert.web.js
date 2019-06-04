import Swal from 'sweetalert2/dist/sweetalert2';
import 'sweetalert2/dist/sweetalert2.css';

export default {
  alert: (title, text, [btn1, btn2], config) => {
    Swal.fire({
      title,
      text,
      showCancelButton: true,
      confirmButtonText: btn2.text,
      cancelButtonText: btn1.text,
    }).then(res => {
      if (res.value) {
        btn2.onPress();
      } else {
        btn1.onPress();
      }
    });
  },
};
