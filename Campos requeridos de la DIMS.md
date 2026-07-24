### 1. Criterios según el Tipo de Usuario / Modalidad del Declarante (`tipoUsuarioDims`)

#### A. **Importación No Presencial / Menor Cuantía (`noPresencial`)**

- **Aduana de Despacho (`datosG.AduanaDespacho`):** Se bloquea la selección libre y se autocompleta con los datos del usuario en sesión.
- **Valor Total USD (`datosG.InfTransaccion.ValorTotalUSD`):** **Requerido**.
  - _Límite Estándar:_ Máximo **$us 2.000** por operación o acumulado de **$us 4.000** en la gestión (para no habituales).
  - _Excepción Modalidad 4105 (Ley 1391):_ Hasta **$us 35.000** acumulados en la gestión.
  - _Excepción Modalidad 4107 (Courier / Abandono):_ Hasta **$us 1.000**.
- **Documentos Soporte Obligatorios:** Es **requerido** adjuntar al menos uno de los siguientes documentos:
  - `CM-003` (Factura Comercial).
  - `CM-004` (Factura de Compra Local / Venta Mercado Interno).
  - `CM-007` (Declaración Jurada).
  - Además, si existe el documento `OT-001` (Parte de Recepción), su consignación es obligatoria.

#### B. **Menaje Doméstico (`menajeDomestico`)**

- **Importador (`datosG.Iportador.TipoDocumento` y `NumeroDocumento`):** Habilitados para edición directa.
- **Aduana de Despacho (`datosG.AduanaDespacho`):** Habilitada para selección.
- **Destino/Régimen Aduanero (`datosG.DestinoRegimenAduanero`):** Se deshabilita y se fija en el régimen `93` (_Menaje Doméstico_).
- **Parte de Recepción (`datosG.numParRec` y `datosG.numParRecSiNo`):**
  - `numParRecSiNo` se marca automáticamente en `true` y se inhabilita el selector.
  - `datosG.numParRec` pasa a ser **estrictamente requerido**.
- **Valor Total USD:** Requerido (hasta un límite de FOB <= **$us 35.000** por ítem para Menaje Doméstico).

---

### 2. Criterios según la Modalidad del Régimen Aduanero (`modReg.cod`)

| Código Modalidad    | Nombre / Descripción                     | Campos Requeridos y Reglas Específicas                                                                                                                                                         |
| :------------------ | :--------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`4101`**          | Menor Cuantía General                    | • **Parte de Recepción (`numParRec`):** Requerido (`numParRecSiNo` = True).<br>• **Valor Total USD:** <= $us 2.000.                                                                            |
| **`4103`**          | Menor Cuantía Especial                   | • **Valor Total USD:** <= $us 3.500.                                                                                                                                                           |
| **`4105`**          | Incentivos Ley 1391 (Bienes de Capital)  | • **Valor Total USD:** <= $us 35.000.<br>• **Subpartida Arancelaria:** Se prohíben subpartidas de la partida `87` (vehículos). Se requiere descripción mínima especial.                        |
| **`4106`**          | Incentivos Ley 1546                      | • **Subpartida Arancelaria:** Se prohíben subpartidas que inicien con `87`.                                                                                                                    |
| **`4107`**          | Abandono Courier / Menor Cuantía Courier | • **Parte de Recepción (`numParRec`):** Requerido.<br>• **Valor Total USD:** <= $us 1.000.<br>• **Peso Bruto Total:** Requerido **<= 40 kg**.                                                  |
| **`9100`**          | Tráfico Postal (Ingreso)                 | • **Parte de Recepción:** Deshabilitado (`numParRecSiNo` = False).<br>• **Medio de Transporte:** Se autoselecciona `5` (_Postal o Courier_).<br>• **Peso Bruto/Neto:** Requerido **<= 40 kg**. |
| **`9200` / `9220`** | Empresas de Servicio Expreso (Courier)   | • **Flete Estimado:** Cálculo base sobre el 2% del valor FOB.<br>• **Transporte hasta Frontera:** Aéreo (`4`) si es aduana aeroportuaria, Carretero (`3`) en otros casos.                      |
| **`9300`**          | Menaje Doméstico                         | • **Parte de Recepción (`numParRec`):** Requerido.<br>• Catálogos de nombres comerciales adaptados.                                                                                            |

---

### 3. Criterios según el Tipo de Aduana de Despacho (`aduDepDs.tip`)

- **Aduana de Aeropuerto (`A`), Interior (`I`) o Postal (`P`):**
  - **País de Última Procedencia (`datosG.Lugares.PaisUltimaProcedencia`):** **Habilitado y Requerido** (No se permite seleccionar Bolivia `BO`).
- **Aduana de Frontera (`F`) o Zona Franca (`Z`):**
  - **País de Última Procedencia:** **Deshabilitado** para edición manual (se asigna automáticamente el país limítrofe correspondiente).
- **Modalidad de Transporte Hasta la Frontera (`tra.hasFro`):**
  - Si el régimen es `41` y la aduana es de Aeropuerto (`A`/`Z`): Requerido **TRANSPORTE AÉREO (4)**.
  - Si el régimen es `41` y la aduana es de Frontera (`F`): Requerido **TRANSPORTE CARRETERO (3)**.
  - Si el régimen es `91`: Requerido **POSTAL O COURIER (5)**.

---

### 4. Criterios de Transacción Comercial (Flete, Seguro e Información Adicional)

- **Flete Declarado (`datosG.InfTransaccion.FletelUSDDec`):**
  - **Requerido** solo si la factura/transacción especifica que el flete fue pagado hasta el lugar de importación (`cosFleHasLugImpUsdSiNo` = True).
  - Si es False, el campo se deshabilita y se exige un porcentaje de cálculo según parametricas (`fleteTotalValidator5`).
- **Seguro Declarado (`datosG.InfTransaccion.CostoSeguroUSDDec`):**
  - **Requerido** solo si la factura/transacción especifica costo de seguro (`cosTotSegUsdSiNo` = True).
  - Si es False, se deshabilita y se calcula la base imponible del seguro.
- **Información Adicional (`docSop.infAdi`):**
  - **Requerido** únicamente cuando el selector `docSop.reqInfAdi` está marcado en **"Sí"**.

---

### 5. Resumen de Campos Siempre Requeridos en Datos Generales

Salvo que todo el formulario esté en modo consulta/solo lectura, los siguientes campos son evaluados obligatoriamente por el `FormGroup`:

1. `datosG.AduanaDespacho`: Aduana de Despacho.
2. `datosG.DestinoRegimenAduanero`: Régimen Aduanero.
3. `datosG.ModalidadRegimen`: Modalidad del Régimen.
4. `datosG.numParRecSiNo`: Indicador Sí/No de Parte de Recepción.
5. `datosG.numParRec`: Número de Parte de Recepción (**Requerido si `numParRecSiNo` es True**).
6. `datosG.Iportador.TipoDocumento`: Tipo de Documento del Importador.
7. `datosG.Iportador.NumeroDocumento`: Número de Documento del Importador.
8. `datosG.Iportador.NombreRazonSocial`: Nombre / Razón Social.
9. `datosG.Iportador.Domicilio`: Domicilio Legal.
10. `datosG.Lugares.DepartamentoDestino`: Departamento de Destino.
11. `datosG.InfTransaccion.ValorTotalUSD`: Valor FOB Total USD.
12. `datosG.InfTransaccion.CantidadBultosTotal`: Cantidad Total de Bultos (> 0).
13. `datosG.InfTransaccion.PesoBrutoTotal`: Peso Bruto Total (> 0, max. 40kg para courier/postal).
14. `datosG.InfTransaccion.PesonetoTotal`: Peso Neto Total (Debe ser menor o igual al peso bruto).
