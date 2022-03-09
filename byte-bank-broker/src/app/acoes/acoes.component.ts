import { merge, Subscription } from 'rxjs';
import { AcoesService } from './acoes.service';
import { Acoes } from './modelo/acoes';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';

const ESPERA_DIGITACAO = 300;

@Component({
  selector: 'app-acoes',
  templateUrl: './acoes.component.html',
  styleUrls: ['./acoes.component.css'],
})
export class AcoesComponent {
  acoesInput = new FormControl();
  // É possível pois estamos usando | async no component.html
  // Se não estivesse usando, precisaria dar subscribe no ngOnInit e unsubscribe no ngOnDestroy
  // Angula sabe o momento de fazer a requisição
  // acoes$ = this.acoesService.getAcoes();

  todasAcoes$ = this.acoesService.getAcoes()
    .pipe(
      tap(()=>{console.log("Fluxo inicial")})
    );

  filtroPeloInput$ = this.acoesInput.valueChanges
    .pipe(
      // Espera 300ms e envia para o fluxo o último valor registrado nesse período
      debounceTime(ESPERA_DIGITACAO),
      tap(()=>{console.log('Fluxo do filtro')}),
      tap(console.log),
      // Só vai para a próxima fase se condições forem satisfeitas
      filter((valorDigitado)=>valorDigitado.length >= 3 || !valorDigitado.length),
      // Só continua se o valor mudou
      distinctUntilChanged(),
      // Troca o fluxo do input da digitação do usuário para o fluxo que vai na API buscar as ações
      switchMap((valorDigitado)=>this.acoesService.getAcoes(valorDigitado))
    );


  // Merge dos 2 fluxos em 1 só
  acoes$ = merge(this.todasAcoes$,this.filtroPeloInput$);

  constructor(private acoesService: AcoesService) {}
}
