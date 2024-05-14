import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto } from './dto';

describe('PurchaseOrdersController', () => {
  let controller: PurchaseOrdersController;
  let service: PurchaseOrdersService;

  const mockPurchaseOrdersService = {
    create: jest.fn().mockImplementation((dto: CreatePurchaseOrderDto) => {
      return { id: 1, ...dto };
    }),
    update: jest
      .fn()
      .mockImplementation((id: number, dto: UpdatePurchaseOrderDto) => {
        return { id, ...dto };
      }),
    findAll: jest.fn().mockImplementation((page: number, limit: number) => {
      return { data: [], totalPages: 1, currentPage: page, hasNextPage: false };
    }),
    findOne: jest.fn().mockImplementation((id: number) => {
      return {
        id,
        vendor_name: 'Vendor',
        order_date: new Date(),
        expected_delivery_date: new Date(),
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchaseOrdersController],
      providers: [
        {
          provide: PurchaseOrdersService,
          useValue: mockPurchaseOrdersService,
        },
      ],
    }).compile();

    controller = module.get<PurchaseOrdersController>(PurchaseOrdersController);
    service = module.get<PurchaseOrdersService>(PurchaseOrdersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createPurchaseOrder', () => {
    it('should create a new purchase order', async () => {
      const createDto: CreatePurchaseOrderDto = {
        vendor_name: 'Vendor',
        order_date: new Date(),
        expected_delivery_date: new Date(),
        purchase_order_line_items: [],
      };

      expect(await controller.createPurchaseOrder(createDto)).toEqual({
        id: 1,
        ...createDto,
      });
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('updatePurchaseOrder', () => {
    it('should update a purchase order', async () => {
      const updateDto: UpdatePurchaseOrderDto = {
        vendor_name: 'Updated Vendor',
        order_date: new Date(),
        expected_delivery_date: new Date(),
        purchase_order_line_items: [],
      };
      const id = 1;

      expect(await controller.updatePurchaseOrder(id, updateDto)).toEqual({
        id,
        ...updateDto,
      });
      expect(service.update).toHaveBeenCalledWith(id, updateDto);
    });
  });

  describe('findAll', () => {
    it('should return all purchase orders with pagination', async () => {
      const page = 1;
      const limit = 10;

      expect(await controller.findAll(page, limit)).toEqual({
        data: [],
        totalPages: 1,
        currentPage: page,
        hasNextPage: false,
      });
      expect(service.findAll).toHaveBeenCalledWith(page, limit);
    });
  });

  describe('findOne', () => {
    it('should return a single purchase order by id', async () => {
      const id = 1;

      expect(await controller.findOne(id)).toEqual({
        id,
        vendor_name: 'Vendor',
        order_date: new Date(),
        expected_delivery_date: new Date(),
      });
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });
});
