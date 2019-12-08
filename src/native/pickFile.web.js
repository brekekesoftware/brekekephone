const pickFile = cb => {
  const input = document.createElement(`input`);
  input.type = `file`;
  input.onchange = function() {
    cb(this.files[0]);
  };
  input.click();
};

export default pickFile;
