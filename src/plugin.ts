import {Traverse, normalize, serialize, serializeConfigPresentation3} from '@iiif/parser';
//import fs from 'fs/promises';
//import * as fs from 'fs';
const fs = require('fs/promises');
//import {readFileSync} from 'node:fs'
const parser = require('@iiif/parser');
import LABELS from './labels.json'
import {TropyIIIFManifest} from "./manifest.js";
//const tropyiiif = require('./manifest');

export default class IIIFCommonsPlugin {
  public context: any;
  public options: any;

  constructor(options, context) {
    this.context = context
    this.options = {
      ...IIIFCommonsPlugin.defaults,
      ...options
    }
  }

  async import(payload) {
    let files: any[] = payload
    const imagesList = [];
    const canvasList = [];
    const annotationList = [];
    const traversal = new Traverse({
      canvas: [
        (currentCanvas) => {
          canvasList.push(currentCanvas.id);
          return currentCanvas;
        },
      ],
      annotation: [
        (currentAnnotation) => {
           annotationList.push(currentAnnotation.id);
           return currentAnnotation;
        },
      ],
    });

    console.log("importing manifest");
    if (!files)
      files = await this.prompt()
    if (!files)
      return

    payload.data = []

    for (let file of files) {
      try {
        debugger;
        let data = JSON.parse(await fs.readFile(file))
        console.log("readinf manifest test v3");
        console.log(data);
		debugger;
//		let manifest = data;
		let manifest = new TropyIIIFManifest(data);

        let resource = normalize(data);

        console.log(manifest);
        console.log("converting manifest");

        payload.data.push(this.convert(resource.entities, manifest))
      } catch (e) {
        this.context.logger.warn(
          {
            stack: e.stack
          },
          `failed to import IIIF manifest ${file}`
        )
      }
    }
  }

  convert(entities, manifest) {
    let { props } = manifest
    let { canvases } = entities.Canvas;
    let { itemTemplate, photoTemplate } = this.options

    let iMap = this.mapLabelsToIds(this.loadTemplate(itemTemplate))
    let pMap = this.mapLabelsToIds(this.loadTemplate(photoTemplate))

	debugger;

    return {
      ...props,
      ...this.getMetadataProperties(manifest["metadata"], iMap),
      template: itemTemplate || undefined,
      photo: canvases.flatMap((c) =>
        c.images.map((i) => ({
          ...c.props,
          ...c.getMetadataProperties(pMap),
          ...i.props,
          ...i.getMetadataProperties(pMap),
          template: photoTemplate || undefined
        }))
      )
    }
  }


  mapLabelsToIds(template) {
    if (!template)
      return LABELS

    let map = {}

    for (let { label, property } of template.fields) {
      if (label) map[label] = property
    }

    return map
  }

  loadTemplate(id) {
    return this.context.window.store?.getState().ontology.template[id]
  }

  prompt() {
    return this.context.dialog.open({
      filters: [
        {
          name: 'IIIF Manifests',
          extensions: ['json']
        }
      ],
      properties: ['openFile', 'multiSelections']
    })
  }

  static defaults = {
    itemTemplate: '',
    photoTemplate: ''
  }
}

module.exports = IIIFCommonsPlugin
