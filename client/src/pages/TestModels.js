const productModel = (id, name, price, description, category) => ({
  _id: id,
  name: name,
  price: price,
  description: description,
  slug: name,
  category: category,
});

const categoryModel = (id, name) => ({
  _id: `c_${id}`,
  name: name,
});

const userModel = (name, address) => ({
  name: name,
  address: address,
});

const authModel = (token, user) => ({
  token: token,
  user: user,
});

export { productModel, categoryModel, userModel, authModel };
