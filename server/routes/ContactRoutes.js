import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { getContactsforDMList, searchContacts } from "../controllers/ContactsController.js";


const contactsRoutes = Router();

contactsRoutes.post("/search", verifyToken, searchContacts );
contactsRoutes.get("/get-contacts-for-dm", verifyToken, getContactsforDMList);

export default contactsRoutes;