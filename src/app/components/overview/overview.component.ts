import { Component, signal } from '@angular/core';
import { OverviewReportComponent } from '../overview-report/overview-report.component';

@Component({
    selector: 'app-overview',
    standalone: true,
    imports: [OverviewReportComponent],
    templateUrl: './overview.component.html',
    styleUrl: './overview.component.css'
})
export class OverviewComponent {
    showOverviewReport = signal(false);

    openOverviewReport() {
        this.showOverviewReport.set(true);
    }

    closeOverviewReport() {
        this.showOverviewReport.set(false);
    }
}
