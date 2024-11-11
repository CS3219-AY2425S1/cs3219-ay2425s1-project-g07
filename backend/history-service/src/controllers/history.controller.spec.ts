import { Test, TestingModule } from '@nestjs/testing';
import { QuestionHistoryController, AttemptHistoryController } from './history.controller';
import { QuestionHistoryService, AttemptHistoryService } from '../services/history.services';
import { CreateQuestionHistoryDto, UpdateQuestionHistoryDto, CreateAttemptHistoryDto, UpdateAttemptHistoryDto } from '../dto/history.dto';
import { NotFoundException } from '@nestjs/common';

describe('QuestionHistoryController', () => {
  let controller: QuestionHistoryController;
  let service: QuestionHistoryService;

  const mockQuestionHistoryService = {
    findAllByStudentId: jest.fn(),
    findByStudentIdAndRoomId: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionHistoryController],
      providers: [
        {
          provide: QuestionHistoryService,
          useValue: mockQuestionHistoryService,
        },
      ],
    }).compile();

    controller = module.get<QuestionHistoryController>(QuestionHistoryController);
    service = module.get<QuestionHistoryService>(QuestionHistoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call findAllByStudentId and return question histories', async () => {
    const studentId = '123';
    const result = [{ id: '1', studentId, roomId: 'room1' }];
    mockQuestionHistoryService.findAllByStudentId.mockResolvedValue(result);

    expect(await controller.findAllByStudentId(studentId)).toEqual(result);
    expect(mockQuestionHistoryService.findAllByStudentId).toHaveBeenCalledWith(studentId);
  });

  it('should call findByStudentIdAndRoomId and return a question history', async () => {
    const studentId = '123';
    const roomId = 'room1';
    const result = { id: '1', studentId, roomId };
    mockQuestionHistoryService.findByStudentIdAndRoomId.mockResolvedValue(result);

    expect(await controller.findByStudentIdAndRoomId(studentId, roomId)).toEqual(result);
    expect(mockQuestionHistoryService.findByStudentIdAndRoomId).toHaveBeenCalledWith(studentId, roomId);
  });

  it('should create a question history', async () => {
    const createDto = new CreateQuestionHistoryDto();
    const result = { id: '1', ...createDto };
    mockQuestionHistoryService.create.mockResolvedValue(result);

    expect(await controller.create(createDto)).toEqual(result);
    expect(mockQuestionHistoryService.create).toHaveBeenCalledWith(createDto);
  });

  it('should update a question history', async () => {
    const id = '1';
    const updateDto = new UpdateQuestionHistoryDto();
    const result = { id, ...updateDto };
    mockQuestionHistoryService.update.mockResolvedValue(result);

    expect(await controller.update(id, updateDto)).toEqual(result);
    expect(mockQuestionHistoryService.update).toHaveBeenCalledWith(id, updateDto);
  });

  it('should delete a question history', async () => {
    const id = '1';
    const result = { id };
    mockQuestionHistoryService.remove.mockResolvedValue(result);

    expect(await controller.remove(id)).toEqual(result);
    expect(mockQuestionHistoryService.remove).toHaveBeenCalledWith(id);
  });

  it('should throw NotFoundException if question history not found', async () => {
    const id = '999';
    mockQuestionHistoryService.findOne.mockRejectedValue(new NotFoundException());

    await expect(controller.findOne(id)).rejects.toThrow(NotFoundException);
    expect(mockQuestionHistoryService.findOne).toHaveBeenCalledWith(id);
  });
});

describe('AttemptHistoryController', () => {
  let controller: AttemptHistoryController;
  let service: AttemptHistoryService;

  const mockAttemptHistoryService = {
    findAllByStudentId: jest.fn(),
    findAllByStudentIdAndRoomId: jest.fn(),
    findAllByStudentIdAndQuestionId: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttemptHistoryController],
      providers: [
        {
          provide: AttemptHistoryService,
          useValue: mockAttemptHistoryService,
        },
      ],
    }).compile();

    controller = module.get<AttemptHistoryController>(AttemptHistoryController);
    service = module.get<AttemptHistoryService>(AttemptHistoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call findAllByStudentId and return attempt histories', async () => {
    const studentId = '123';
    const result = [{ id: '1', studentId }];
    mockAttemptHistoryService.findAllByStudentId.mockResolvedValue(result);

    expect(await controller.findAllByStudentId(studentId)).toEqual(result);
    expect(mockAttemptHistoryService.findAllByStudentId).toHaveBeenCalledWith(studentId);
  });

  it('should create an attempt history', async () => {
    const createDto = new CreateAttemptHistoryDto();
    const result = { id: '1', ...createDto };
    mockAttemptHistoryService.create.mockResolvedValue(result);

    expect(await controller.create(createDto)).toEqual(result);
    expect(mockAttemptHistoryService.create).toHaveBeenCalledWith(createDto);
  });

  it('should update an attempt history', async () => {
    const id = '1';
    const updateDto = new UpdateAttemptHistoryDto();
    const result = { id, ...updateDto };
    mockAttemptHistoryService.update.mockResolvedValue(result);

    expect(await controller.update(id, updateDto)).toEqual(result);
    expect(mockAttemptHistoryService.update).toHaveBeenCalledWith(id, updateDto);
  });

  it('should delete an attempt history', async () => {
    const id = '1';
    const result = { id };
    mockAttemptHistoryService.remove.mockResolvedValue(result);

    expect(await controller.remove(id)).toEqual(result);
    expect(mockAttemptHistoryService.remove).toHaveBeenCalledWith(id);
  });

  it('should throw NotFoundException if attempt history not found', async () => {
    const id = '999';
    mockAttemptHistoryService.findOne.mockRejectedValue(new NotFoundException());

    await expect(controller.findOne(id)).rejects.toThrow(NotFoundException);
    expect(mockAttemptHistoryService.findOne).toHaveBeenCalledWith(id);
  });
});
