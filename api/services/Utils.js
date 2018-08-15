/**
 * Utils
 *
 * @description :: Service that exposes utility methods. E.G. Current date in DD/MM/YYYY format
 */

module.exports = {

  currDate: function () {
    var now = new Date();
    var dd = now.getDate();
    var mm = now.getMonth()+1; //January is 0!
    var yyyy = now.getFullYear();
    if(dd<10) {
      dd = '0'+dd;
    }
    if(mm<10) {
      mm = '0'+ mm;
    }
    return (dd + '/' + mm + '/' + yyyy);
  },

  returnJsonError: function (err) {
    return {
      error: true,
      warning: false,
      message: 'Fatal Error Occurred, Try Again Later',
      content: err
    };
  }
};