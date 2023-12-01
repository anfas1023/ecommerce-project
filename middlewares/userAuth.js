// const isLogin = (req, res, next) => {
//     if (req.session.userId) {
//         console.log(req.session.userId);
//         next();
//     } else {
//         console.log(req.session.userId);
//         res.redirect('/login');
//     }
// };

// const isLogout=async(req,res,next)=>{

//     try{

//         if(req.session.user){
//             res.redirect('/');
//         }
//         next();
//     }catch(error){
//         console.log(error.message);
//     }

// }

module.exports={
    isLogin,

}