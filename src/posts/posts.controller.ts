import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
  Res,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { BaseAuthGuard } from '../common/guards/base-auth-guard';
import { BloggersService } from '../bloggers/bloggers.service';
import { Response } from 'express';
import { CommentsService } from '../comments/comments.service';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';
import { v4 } from 'uuid';
import { CommentInput } from '../comments/dto/comment.input';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly bloggersService: BloggersService,
    private readonly commentsService: CommentsService,
  ) {}

  @UseGuards(BaseAuthGuard)
  @Post()
  async create(@Body() createPostDto: CreatePostDto, @Res() res: Response) {
    const blogger = await this.bloggersService.findOne(createPostDto.bloggerId);

    if (!blogger) {
      return res.status(HttpStatus.NO_CONTENT).send();
    }

    const post = await this.postsService.create(createPostDto);
    return post;
  }

  @Get()
  async findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @UseGuards(BaseAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Res() res: Response,
  ) {
    const blogger = await this.bloggersService.findOne(updatePostDto.bloggerId);

    if (!blogger) {
      throw new BadRequestException();
    }

    const post = await this.postsService.update(id, updatePostDto);

    if (!post) {
      throw new BadRequestException();
    }

    return res.status(HttpStatus.NO_CONTENT).send();
  }

  @Put(':id')
  async updatePatch(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, updatePostDto);
  }

  @UseGuards(BaseAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res: Response) {
    const isDeleted = await this.postsService.remove(id);

    if (!isDeleted) {
      throw new BadRequestException();
    }

    return res.status(HttpStatus.NO_CONTENT).send();
  }

  @Get(':id/comments')
  async findPostComments(@Param('id') id: string, @Res() res: Response) {
    const post = await this.postsService.findOne(id);

    if (!post) {
      throw new BadRequestException({
        field: '',
        message: "Post doesn't exist",
      });
    }

    const comments = await this.commentsService.findPostComments(post.id);

    if (!post) {
      throw new BadRequestException({
        field: '',
        message: "Comments doesn't exist",
      });
    }

    res.status(200).send(comments);
  }

  @Post(':id/comments')
  async createPostComment(
    @Param('id') id: string,
    @Body() createCommentDto: CommentInput,
    @Res() res: Response,
  ) {
    const comment = await this.commentsService.create({
      postId: id,
      content: createCommentDto.content,
      userId: 'userId from ctx',
      userLogin: 'userLogin from ctx',
    });

    if (!comment) {
      throw new BadRequestException({
        field: '',
        message: "Comment doesn't created",
      });
    }

    res.status(HttpStatus.OK).send(comment);
  }
}
