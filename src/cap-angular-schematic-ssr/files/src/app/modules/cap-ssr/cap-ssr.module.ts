import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TransferHttpResponseInterceptor } from './services/transfer-http-response-interceptor.service';
import { BrowserTransferStateModule } from '@angular/platform-browser';


@NgModule({
  imports: [BrowserTransferStateModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TransferHttpResponseInterceptor,
      multi: true
    }
  ],
  declarations: []
})
export class CapSSRModule {
}