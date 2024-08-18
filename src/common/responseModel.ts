export class ResponseModel<T> {
    data?: T;
    isSuccess?: boolean;
    error?: string;
    isServerError?: boolean;
    isUnAuthorized?: boolean;
    message?: string;
    serverError?: string;
    statusCode?: number;
  
    constructor() {
      this.isSuccess = true;
      this.statusCode = 200;
    }
    setError(message: string, isServerError: boolean = false): void {
      this.isSuccess = false;
      this.message = message;
      this.isServerError = isServerError;
      this.error = 'Error';
      this.statusCode = isServerError ? 500 : 400;
    }
    setSuccess(message: string): void {
      this.isSuccess = true;
      this.isServerError = false;
      this.message = message;
    }
  
    setSuccessAndData(data: T, message: string): void {
      this.data = data;
      this.isSuccess = true;
      this.isServerError = false;
      this.message = message;
    }
    setSuccessAndMutipleData(data: T, data1: T, message: string): void {
      this.data = data;
      this.isSuccess = true;
      this.isServerError = false;
      this.message = message;
    }
    setServerError(ex: any): void {
      this.serverError = ex;
      this.setError('ERROR: ' + ex.message, true);
      this.error = 'Error';
      this.statusCode = ex?.status || 500;
    }
  
    setUnAuthorized(message: string): void {
      this.isUnAuthorized = true;
      this.data = undefined;
      this.setError(message);
      this.statusCode = 401;
    }
  
    setErrorWithData(message: string, isServerError: boolean = false, data: any): void {
      this.isSuccess = false;
      this.message = message;
      this.isServerError = isServerError;
      this.data = data;
      this.error = 'Error';
      this.statusCode = isServerError ? 500 : 400;
    }
  }
  
  export class ListDTO<T> {
    list: T[] = [];
    page: number = 1;
    size: number = 0;
    totalCount?: number = 0;
  }
  