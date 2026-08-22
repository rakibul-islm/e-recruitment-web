import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../base.component';
import { SystemConfigService } from '../../../services/system-config/system-config.service';
import { SystemConfig } from '../../../services/system-config/domain/system-config.domain';

@Component({
  selector: 'app-system-config-view',
  templateUrl: './system-config.view.component.html'
})
export class SystemConfigViewComponent extends BaseComponent implements OnInit {
  systemConfig: SystemConfig = new SystemConfig();
  systemConfigId!: number;

  constructor(
    private route: ActivatedRoute,
    protected router: Router,
    private systemConfigService: SystemConfigService
  ) {
    super();
  }

  ngOnInit(): void {
    this.systemConfigId = Number(this.route.snapshot.paramMap.get('id'));
    this.fetchSystemConfig();
  }

  fetchSystemConfig(): void {
    this.subscribers.findSystemConfigSub = this.systemConfigService.findSystemConfigById(this.systemConfigId).subscribe(response => {
      this.systemConfig = response?.obj;
    });
  }

  navigateToSearch(): void {
    this.router.navigate(['/system-configs']);
  }
}
