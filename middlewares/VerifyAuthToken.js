import jsonwebtoken from "jsonwebtoken";
const jwt=jsonwebtoken;


function VerifyAuthToken(req,res,next){
    //Post a successful login attempt, a JWT will be incorporated into the response headers, which is defined in the /api/user/login route
    //It is important to mention that in case of a frontend consuming the authentication API storing the JWT in localstorage or session storage makes it accessible by any script inside the page which allow XSS attacks to give an external attacker access to the JWT.
    //The best way to secure JWTs is to always store them inside a HTTPOnly cookie which makes the JWT unaccessible through javascript code running in the browser.
    const token = req.header("auth-token");
    if(!token) return res.status(403);
    try {
        //verifying the JWT incorporated in the request's headers.
        const loggedIn = jwt.verify(token,process.env.AUTH_TOKEN_SECRET);
        req.user=loggedIn;
        next();
    } catch (error) {
        res.status(403);
    }
}

export default VerifyAuthToken;