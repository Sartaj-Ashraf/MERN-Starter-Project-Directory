import { StatusCodes } from "http-status-codes";
import User from "../models/userModel.js";
import { comparePassword, hashpasword } from "../utils/passwordUtils.js";
import { UnAuthenticatedErr } from "../errors/customErors.js";
import { createJWT } from "../utils/tokenUtils.js";

export const register = async (req, res) => {
  const isFirst = (await User.countDocuments()) === 0;

  req.body.role = isFirst ? "admin" : "user";
  req.body.password = await hashpasword(req.body.password);

  req.body.isVerified =true
  const user=await User.create(req.body);
  res.status(StatusCodes.CREATED).json({
    msg: "success! ",
    role:user.role,
  });
};


export const login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const isValidUser =
    user && (await comparePassword(req.body.password, user.password));
  if (!isValidUser) throw new UnAuthenticatedErr("invalid Credentials");
  if (!user.isVerified)
    throw new UnAuthenticatedErr("please verify your email");
  const token = createJWT({ userId: user._id, role: user.role, email: user.email});
  const oneDay = 1000 * 60 * 60 * 24;
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV == "production",
  });
  res.status(StatusCodes.OK).json({ msg: "user logged in",role:user.role });
  console.log(res.cookie);
};

export const logout = (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "user logged out!" });
};

export const verifyEmail = async (req, res) => {
  const {verificationToken, email} = req.body
  const user = await User.findOne({email})

  if(!user) {
    throw new UnAuthenticatedErr("verification failed")
  }
  if (user.verificationToken !== verificationToken){
    throw new UnAuthenticatedErr("verification failed");
  }
  user.isVerified =true
   user.verified = Date.now()
   user.verificationToken = ""

   await user.save()
   res.status(StatusCodes.OK).json({msg:"email verified"})
};
// export const register = async (req, res) => {
//   const isFirst = (await User.countDocuments()) === 0;
//   req.body.role = isFirst ? "admin" : "user";
//   req.body.password = await hashpasword(req.body.password);
//   req.body.verificationToken = crypto.randomBytes(20).toString("hex");

//   const user = await User.create(req.body);
//   const origin = "http://localhost:5173";
//   await sendVerificationEmail({
//     name: user.name,
//     email: user.email,
//     verificationToken: user.verificationToken,
//     origin,
//   });
//   res.status(StatusCodes.CREATED).json({
//     msg: "success! please check your email to verify account",
//   });
// };
