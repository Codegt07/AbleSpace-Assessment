import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Workspace,
  WorkspaceDocument,
} from './schemas/workspace.schema';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectModel(Workspace.name)
    private readonly workspaceModel: Model<WorkspaceDocument>,
  ) {}

  async create(name: string, ownerId: string) {
    return this.workspaceModel.create({
      name,
      ownerId,
    });
  }

  async findByOwner(ownerId: string) {
    return this.workspaceModel.find({ ownerId }).exec();
  }
}