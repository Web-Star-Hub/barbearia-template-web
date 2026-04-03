import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiSuccessResponseInterface } from '../../../core/models/api-response.interface';
import {
    BusinessLocationInterface,
    ServiceCatalogItemInterface,
} from '../../../core/models/domain.models';

@Injectable({
    providedIn: 'root',
})
export class ServiceCatalogApiService {
    private readonly apiBaseUrl = environment.apiBaseUrl;

    constructor(private readonly httpClient: HttpClient) {}

    public listServices(): Observable<ServiceCatalogItemInterface[]> {
        return this.httpClient
            .get<ApiSuccessResponseInterface<ServiceCatalogItemInterface[]>>(
                `${this.apiBaseUrl}/services`
            )
            .pipe(map((response) => response.data));
    }

    public getBusinessLocation(): Observable<BusinessLocationInterface | null> {
        return this.httpClient
            .get<ApiSuccessResponseInterface<BusinessLocationInterface | null>>(
                `${this.apiBaseUrl}/business-location`
            )
            .pipe(map((response) => response.data));
    }
}
