const {mongoose, bcrypt} = require("../package");
const {
  safeSoftDeletePlugin,
  paginatePlugin,
  privateFieldsPlugin,
} = require("./plugins");
const refFields = require("./refFields/user.refFields");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, private: true },
}, { timestamps: true });

userSchema.plugin(safeSoftDeletePlugin, {
  deletedAtField: 'deletedAt',
  refFields,
})
userSchema.plugin(paginatePlugin);
userSchema.plugin(privateFieldsPlugin);

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});


userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
module.exports = mongoose.model('User', userSchema);
