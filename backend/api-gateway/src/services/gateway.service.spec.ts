import axios from 'axios';
import { Request, Response } from 'express';
import { jest } from '@jest/globals';

import { GatewayService } from './gateway.service';

jest.mock('axios');

describe('GatewayService', () => {
  let gatewayService: GatewayService;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    gatewayService = new GatewayService();

    mockReq = {
      originalUrl: '/api/test-path',
      method: 'GET',
      headers: {
        'x-custom-header': 'test-value',
      },
      body: { data: 'test' },
    };

    mockRes = {
      status: jest.fn().mockReturnThis() as unknown as Response['status'],
      json: jest.fn() as unknown as Response['json'],
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect request by using service domain/test-path, remove /api', async () => {
    const serviceDomain = 'http://peerprep.com';
    (axios as jest.MockedFunction<typeof axios>).mockResolvedValue({
      status: 200,
      data: { message: 'success' },
    });
    await gatewayService.handleRedirectRequest(mockReq as Request, mockRes as Response, serviceDomain);

    expect(axios).toHaveBeenCalledWith({
      method: 'GET',
      url: `${serviceDomain}/test-path`,
      headers: { XCustomHeader: 'test-value' },
      data: { data: 'test' },
    });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'success' });
  });

  it('should handle an error when the request fails, propagate error through', async () => {
    const serviceDomain = 'http://peerprep.com';
    (axios as jest.MockedFunction<typeof axios>).mockRejectedValue({
      response: {
        status: 503,
        data: { message: 'Service Unavailable' },
      },
    });
    await gatewayService.handleRedirectRequest(mockReq as Request, mockRes as Response, serviceDomain);

    expect(mockRes.status).toHaveBeenCalledWith(503);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Service Unavailable' });
  });

  it('should convert headers to axios-compatible format', () => {
    const headers = {
      'x-custom-header': 'test-value',
      'another-header': 'another-value',
    };
    const result = gatewayService.getHeaders(headers);

    expect(result).toEqual({
      XCustomHeader: 'test-value',
      AnotherHeader: 'another-value',
    });
  });
});
