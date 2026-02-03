//This file isa traffic control for the posts section of the API. It defines specific endpoints that users can interact with. 

import { Router } from 'express';
import { listPosts, createPost } from '#controllers/posts.controller';

export const postsRouter = Router();

postsRouter.get('/', listPosts);
postsRouter.post('/', createPost);
