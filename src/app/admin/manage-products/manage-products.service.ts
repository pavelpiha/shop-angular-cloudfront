import { Injectable, Injector } from '@angular/core';
import { EMPTY, Observable, of } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { catchError, switchMap } from 'rxjs/operators';
import { NotificationService } from '../../core/notification.service';

@Injectable()
export class ManageProductsService extends ApiService {
  constructor(
    injector: Injector,
    private readonly notificationService: NotificationService
  ) {
    super(injector);
  }

  uploadProductsCSV(file: File): Observable<unknown> {
    if (!this.endpointEnabled('import')) {
      console.warn(
        'Endpoint "import" is disabled. To enable change your environment.ts config'
      );
      return EMPTY;
    }

    return this.getPreSignedUrl(file.name).pipe(
      switchMap((url) =>
        this.http.put(url, file, {
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'Content-Type': 'text/csv',
          },
        })
      ),
      // eslint-disable-next-line rxjs/no-implicit-any-catch
      catchError((response: { error: Error }) => {
        this.notificationService.showError(response.error.message);
        return of(null);
      })
    );
  }

  private getTokenFromLocalStorage(): string {
    const token = localStorage.getItem('shop_token');
    return token ? token : '';
  }

  private getPreSignedUrl(fileName: string): Observable<string> {
    const url = this.getUrl('import', 'import');

    return this.http.get<string>(url, {
      params: {
        name: fileName,
      },
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Authorization: this.getTokenFromLocalStorage(),
      },
    });
  }
}
