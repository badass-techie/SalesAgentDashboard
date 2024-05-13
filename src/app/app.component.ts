import {Component, ViewChild} from '@angular/core';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {AsyncPipe, NgForOf} from "@angular/common";
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from "@angular/material/sidenav";
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatDivider} from "@angular/material/divider";
import {SchoolsService} from "./schools/schools.service";
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from "@angular/material/expansion";
import {AppService} from "./app.service";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgForOf, AsyncPipe, MatSidenavContainer, MatSidenavContent, MatButton, MatIcon, MatSidenav, RouterLink, RouterLinkActive, MatDivider, MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  @ViewChild(MatSidenav) sidenav: MatSidenav | undefined;
  schools$ = this.schoolsService.getSchools();
  viewportIsWide = true;

  constructor(
    private appService: AppService,
    private schoolsService: SchoolsService,
    protected router: Router,
    private breakpointObserver: BreakpointObserver
  ) {
    appService.toggleSidenav.subscribe(() => {
      this.sidenav?.toggle();
    });
  }

  ngOnInit() {
    this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small
    ]).subscribe(result => {
      this.viewportIsWide = !result.matches;
    });
  }

  closeSidenavIfNotWide() {
    if (!this.viewportIsWide && this.sidenav?.opened) {
      this.sidenav.close();
    }
  }
}
