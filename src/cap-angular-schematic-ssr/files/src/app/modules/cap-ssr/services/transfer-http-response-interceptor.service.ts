import { Observable, of } from 'rxjs';
import { Inject, Injectable, PLATFORM_ID, ApplicationRef } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse, HttpHeaders } from '@angular/common/http';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { filter, take, tap } from 'rxjs/operators';

const STATE_KEY_PREFIX = 'http_requests:';

export interface TransferHttpResponse {
  body?: any | null;
  headers?: {[k: string]: string[]};
  status?: number;
  statusText?: string;
  url?: string;
}

function getHeadersMap(headers: HttpHeaders) {
  const headersMap: Record<string, string[] | null> = {};
  for (const key of headers.keys()) {
    headersMap[key] = headers.getAll(key);
  }
  return headersMap;
}


@Injectable()
export class TransferHttpResponseInterceptor implements HttpInterceptor {

  private isCacheActive = true;

  constructor(
    appRef: ApplicationRef, 
    private transferState: TransferState,
    @Inject(PLATFORM_ID) private platformId: string) {
    // Stop using the cache if the application has stabilized, indicating initial rendering is
    // complete.
    // tslint:disable-next-line: no-floating-promises
    appRef.isStable
      .pipe(
        filter((isStable: boolean) => isStable),
        take(1)
      ).toPromise()
      .then(() => { 
        this.isCacheActive = false;
        console.log('Stop using the cache');
      });
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // clone request and replace 'http://' with 'https://' at the same time
    const httpsReq = req.clone({
      url: req.url.replace("http://", "https://")
    });

    // Nothing to do with non-GET requests
    if (req.method !== 'GET') {
      return next.handle(httpsReq);
    }
    
    if (!this.isCacheActive) {
      // Cache is no longer active. Pass the request through.
      return next.handle(httpsReq);
    }

    const key = makeStateKey<HttpResponse<object>>(STATE_KEY_PREFIX + req.url);

    if (isPlatformBrowser(this.platformId)) {
      // Try reusing transferred response from server
      if (this.transferState.hasKey(key)) {

        // Request found in cache. Respond using it.
        const cachedResponse = this.transferState.get(key, null);
        
        if (cachedResponse) {
          this.transferState.remove(key); // cached response should be used for the very first time
          const response = {
            body: cachedResponse.body,
            headers: new HttpHeaders(cachedResponse.headers),
            status: cachedResponse.status,
            statusText: cachedResponse.statusText + ' (cached server response)',
            url: cachedResponse.url
          }
          return of(new HttpResponse(response));
        }
      }
      return next.handle(httpsReq);
    }

    if (isPlatformServer(this.platformId)) {

      // Try saving response to be transferred to browser
      return next.handle(httpsReq).pipe(tap(event => {
        if (event instanceof HttpResponse && event.status == 200) {
          // http response is not a POJO and it needs custom serialization/deserialization.
          const response = {
            body: event.body,
            headers: getHeadersMap(event.headers),
            status: event.status,
            statusText: event.statusText,
            url: event.url || '',
          };
          this.transferState.set(key, response);
        }
      }));
    }
  }
}
