import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';
import { Blogger, BloggerSchema } from '../bloggers/schemas/bloggers.schema';
import { Post, PostSchema } from '../posts/schemas/posts.schema';
import { Comment, CommentSchema } from './schemas/comments.schema';
import { AuthModule } from '../auth/auth.module';
import { PostsRepository } from '../posts/posts.repository';
import { BloggersRepository } from '../bloggers/bloggers.repository';
import { CommentsRepository } from './comments.repository';
import { getModelToken } from '@nestjs/mongoose';

describe('CommentsController', () => {
  let commentController: CommentsController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let bloggerModel: Model<Blogger>;
  let postModel: Model<Post>;
  let commentModel: Model<Comment>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    bloggerModel = mongoConnection.model(Blogger.name, BloggerSchema);
    postModel = mongoConnection.model(Post.name, PostSchema);
    commentModel = mongoConnection.model(Comment.name, CommentSchema);
    const app: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
      controllers: [CommentsController],
      providers: [
        PostsRepository,
        BloggersRepository,
        CommentsService,
        CommentsRepository,
        { provide: getModelToken(Blogger.name), useValue: bloggerModel },
        { provide: getModelToken(Post.name), useValue: postModel },
        { provide: getModelToken(Comment.name), useValue: commentModel },
      ],
    }).compile();
    commentController = app.get<CommentsController>(CommentsController);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  it('commentController should be defined', async () => {
    expect(commentController).toBeDefined();
  });
});
