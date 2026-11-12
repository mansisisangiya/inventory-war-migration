import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';

// DEPRECATED: these are the pre-MDC Material components. v15 renames them to "legacy"
// (MDC migration needed), v17 removes the legacy versions.
const MODULES = [MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatTableModule, MatToolbarModule];

@NgModule({
  imports: MODULES,
  exports: MODULES
})
export class MaterialModule { }
