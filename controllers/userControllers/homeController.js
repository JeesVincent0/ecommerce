import Product from "../../models/productSchema.js"
import logger from '../../utils/logger.js';

const homeController = {
    //@desc render home page
    //GET /home
    getHome: async (req, res) => {
        try {
    
            const sneakers = await Product.find().limit(15)
            res.render("user/home", { sneakers })
        } catch (error) {
            logger.error(error);
        }
    }
}

export default homeController;