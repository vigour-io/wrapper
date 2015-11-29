'use strict'

var Plugin = require('../../../lib/plugin')

describe('Working with Plugins: InverterBoy', function () {
  var inverterBoy = new Plugin({
    on: {
      init: {
        mock (data, event) {
          setTimeout(() => {
            console.error('!!')
            this.ready.val = true
          }, 100)
        }
      }
    },
    string: {
      on: {
        data: {
          condition (data, next, event) {
            setTimeout(() => {
              next(false, data.split('').reverse().join(''))
            }, 100)
          },
          mock (data, event) {
            this.set(data, event)
            console.error(data, event)
          }
        }
      }
    }
  })

  it('set a string', function (done) {
    inverterBoy.string.val = 'helloworld'
    done()
    console.log(inverterBoy.string.val)
    setTimeout(function(){
      console.log(inverterBoy.string.val)
    },1000)
    // setTimeout(function () {
    //   expect(inverterBoy.string.val).equals('helloworld')
    //   expect(inverterBoy.initialised.val === true).ok
    //   expect(inverterBoy.ready.val === false).ok
    //   expect(inverterBoy.loading.val).ok
    // }, 10)
    // setTimeout(function () {
    //   expect(inverterBoy.string.val === 'dlrowolleh').ok
    //   expect(inverterBoy.loading.val === false).ok
    //   expect(inverterBoy.ready.val === true).ok
    //   done()
    // }, 150)
  })

  // it('set another string', function () {
  //   inverterBoy.string.val = '123'
  //   expect(inverterBoy.string.val === '321').ok
  // })

  // it('set initialised to false => plugin needs to reinitialise', function (done) {
  //   inverterBoy.initialised.val = false
  //   inverterBoy.string.val = 'helloworld'
  //   setTimeout(function () {
  //     expect(inverterBoy.string.val !== 'dlrowolleh').ok
  //     expect(inverterBoy.initialised.val === true).ok
  //     expect(inverterBoy.ready.val === false).ok
  //     expect(inverterBoy.loading.val).ok
  //   }, 10)
  //   setTimeout(function () {
  //     expect(inverterBoy.string.val === 'dlrowolleh').ok
  //     expect(inverterBoy.loading.val === false).ok
  //     expect(inverterBoy.ready.val === true).ok
  //     done()
  //   }, 150)
  // })
})

// describe('Working with Plugins: Social', function () {
//   var social = new Plugin({
//     on: {
//       init: {
//         mock (data, event) {
//           setTimeout(() => {
//             this.ready.val = true
//           }, 20)
//         }
//       },
//       login: {
//         mock (data, event) {
//           this.loading.val = 'login'
//           setTimeout(() => {
//             this.loggedin.val = true
//             if (this.loading.val === 'login') {
//               this.loading.val = false
//             }
//           }, 10)
//         }
//       },
//       logout: {
//         mock (data, event) {
//           this.loading.val = 'logout'
//           setTimeout(() => {
//             this.loggedin.val = false
//             if (this.loading.val === 'logout') {
//               this.loading.val = false
//             }
//           }, 5)
//         }
//       }
//     },
//     loggedin: false,
//     user: {
//       on: {
//         data (data, event) {
//           if (this.val) {
//             this.parent.emit('login', this.val, event)
//           } else {
//             this.parent.emit('logout', this.val, event)
//           }
//         }
//       }
//     }
//   })

//   it('set a user => initialised api and logs in', function (done) {
//     social.user.val = true
//     setTimeout(function () {
//       expect(social.loggedin.val === false).ok
//       expect(social.initialised.val === true).ok
//       expect(social.ready.val === false).ok
//       expect(social.loading.val).ok
//     }, 10)
//     setTimeout(function () {
//       expect(social.loggedin.val === true).ok
//       expect(social.loading.val === false).ok
//       expect(social.ready.val === true).ok
//       done()
//     }, 150)
//   })
// })
