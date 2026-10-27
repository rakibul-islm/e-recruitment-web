import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseComponent } from '../../base.component';
import { Banner, BannerRequest } from '../../../services/banner/domain/banner.domain';
import { BannerService } from '../../../services/banner/banner.service';
import { CommonConfirmDialogService } from '../../../services/utility/common.confirm.dialog.service';
import { bannerUrl } from '../../../services/utility/logo.util';
import { resizeImageToDataUrl } from '../../../utils/image.util';

const BANNER_MAX_WIDTH = 1600;
const MAX_SOURCE_BYTES = 10 * 1024 * 1024;
const MAX_GIF_BYTES = 5 * 1024 * 1024;
const RESIZABLE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@Component({
  selector: 'app-banner-search',
  templateUrl: './banner.search.component.html',
  styleUrls: ['./banner.search.component.scss']
})
export class BannerSearchComponent extends BaseComponent implements OnInit {
  banners: Banner[] = [];

  addDialogVisible = false;
  addForm!: FormGroup;
  saving = false;

  // Resized to 1600px width; GIFs uploaded as-is to keep the animation.
  imagePreview: string | null = null;
  private pendingImage: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private bannerService: BannerService,
    private commonConfirmDialogService: CommonConfirmDialogService
  ) {
    super();
  }

  ngOnInit(): void {
    this.addForm = this.formBuilder.group({
      name: ['', Validators.required],
      visibleFrom: [null],
      visibleTo: [null],
      setActive: [true]
    });
    this.fetchBanners();
  }

  bannerSrc(banner: Banner): string | null {
    return bannerUrl(banner.fileId);
  }

  // Null when no visibility window; the template shows "always visible" then.
  validityLabel(banner: Banner): string | null {
    const from = banner.visibleFrom ? new Date(banner.visibleFrom) : null;
    const to = banner.visibleTo ? new Date(banner.visibleTo) : null;
    if (!from && !to) { return null; }
    const format = (d: Date | null) => d ? d.toLocaleDateString() : '∞';
    return format(from) + ' – ' + format(to);
  }

  fetchBanners(): void {
    this.loading = true;
    const params = new Map<any, any>().set('isPageable', false);
    this.subscribers.bannersSub = this.bannerService.listBanners(params).subscribe({
      next: response => {
        this.banners = response?.list || [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  openAddDialog(): void {
    this.addForm.reset({ name: '', visibleFrom: null, visibleTo: null, setActive: true });
    this.imagePreview = null;
    this.pendingImage = null;
    this.addDialogVisible = true;
  }

  async onImageSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) { return; }

    this.imagePreview = null;
    this.pendingImage = null;

    if (file.type === 'image/gif') {
      if (file.size > MAX_GIF_BYTES) {
        this.notificationService.sendErrorMsg('banner.gifTooLarge');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        this.pendingImage = reader.result as string;
        this.imagePreview = this.pendingImage;
      };
      reader.readAsDataURL(file);
      return;
    }

    if (!RESIZABLE_TYPES.includes(file.type)) {
      this.notificationService.sendErrorMsg('banner.imageInvalid');
      return;
    }
    if (file.size > MAX_SOURCE_BYTES) {
      this.notificationService.sendErrorMsg('banner.imageTooLarge');
      return;
    }
    try {
      this.pendingImage = await resizeImageToDataUrl(file, BANNER_MAX_WIDTH);
      this.imagePreview = this.pendingImage;
    } catch {
      this.notificationService.sendErrorMsg('banner.imageInvalid');
    }
  }

  removeImage(): void {
    this.imagePreview = null;
    this.pendingImage = null;
  }

  createBanner(): void {
    if (this.isFormInvalid(this.addForm)) { return; }
    if (!this.pendingImage) {
      this.notificationService.sendErrorMsg('banner.imageRequired');
      return;
    }
    this.saving = true;
    const { visibleFrom, visibleTo } = this.addForm.value;
    const payload: BannerRequest = {
      name: this.addForm.value.name,
      active: this.addForm.value.setActive ?? true,
      visibleFrom: visibleFrom || null,
      visibleTo: visibleTo || null,
      imageBase64: this.pendingImage.split(',')[1] || ''
    };
    this.subscribers.createBannerSub = this.bannerService.createBanner(payload).subscribe({
      next: () => {
        this.saving = false;
        this.addDialogVisible = false;
        this.notificationService.sendSuccessMsg('banner.createSuccess');
        this.fetchBanners();
      },
      error: () => { this.saving = false; }
    });
  }

  activateBanner(banner: Banner): void {
    this.subscribers.activateBannerSub = this.bannerService.updateBanner({
      id: banner.id,
      name: banner.name,
      active: true,
      visibleFrom: banner.visibleFrom || null,
      visibleTo: banner.visibleTo || null
    }).subscribe(() => {
      this.notificationService.sendSuccessMsg('banner.activateSuccess');
      this.fetchBanners();
    });
  }

  deleteBanner(banner: Banner): void {
    this.commonConfirmDialogService.confirm(
      () => {
        this.subscribers.deleteBannerSub = this.bannerService.deleteBanner(banner.id).subscribe(() => {
          this.notificationService.sendSuccessMsg('banner.deleteSuccess');
          this.fetchBanners();
        });
      },
      null,
      'banner.deleteConfirm', { name: banner.name }
    );
  }
}
