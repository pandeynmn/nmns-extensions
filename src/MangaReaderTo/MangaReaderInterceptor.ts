import {
  Request,
  RequestInterceptor,
  Response,
} from "paperback-extensions-common";

export class MangaReaderInterceptor implements RequestInterceptor {
  interceptors: RequestInterceptor[];

  async interceptRequest(request: Request): Promise<Request> {
    return request;
  }
  async interceptResponse(response: Response): Promise<Response> {
    for (const interceptor of this.interceptors) {
      response = await interceptor.interceptResponse(response);
    }
    return response;
  }
  constructor(interceptors: RequestInterceptor[]) {
    this.interceptors = interceptors;
  }
}
