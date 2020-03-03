module.exports.formatCartItems = (itemsList) => {
    itemsList.map( items => {
    const  { pid, productId, quantity, createdAt, cost, name, altText, file } = items
    console.log("module.exports.formatCartItems ->  pid, productId, quantity, createdAt, cost, name, altText, file",  pid, productId, quantity, createdAt, cost, name, altText, file)

    return pid, productId, quantity, createdAt, cost, name, altText, file
 })
 return {

    "added": createdAt,
    "each": cost,
    "itemId": pid,
    "name": name,
    "productId": productId,
    "quantity": quantity,
    "thumbnail": {
        "altText": altText,
        "url": `http://api.sc.lfzprototypes.com/images/thumbnails/${file}`
    },
    "total": cost * quantity
}
}