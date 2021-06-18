/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/
import { Box2Abs, StereoFlag, scale } from 'ketcher-core'

import { Fragment } from 'ketcher-core'
import { LayerMap } from './GeneralEnumTypes'
import ReObject from './ReObject'
import ReStruct from './index'
import Render from '..'

class ReEnhancedFlag extends ReObject {
  #path: any

  constructor() {
    super('enhancedFlag')
  }

  static isSelectable() {
    return true
  }
  highlightPath(render: Render): any {
    var box = Box2Abs.fromRelBox(this.#path.getBBox())
    var sz = box.p1.sub(box.p0)
    var p0 = box.p0.sub(render.options.offset)
    return render.paper.rect(p0.x, p0.y, sz.x, sz.y)
  }
  drawHighlight(render: Render): any {
    // TODO: after the enhanced flag stops being displayed, need to remove the reEnhancedflag object from ctab
    if (!this.#path?.atrrs) return null
    var ret = this.highlightPath(render).attr(render.options.highlightStyle)
    render.ctab.addReObjectPath(LayerMap.highlighting, this.visel, ret)
    return ret
  }
  // @ts-ignore
  makeSelectionPlate(restruct: ReStruct, paper: any, options: any): any {
    // TODO: after the enhanced flag stops being displayed, need to remove the reEnhancedflag object from ctab
    if (!this.#path?.attrs) return null
    return this.highlightPath(restruct.render).attr(options.selectionStyle)
  }

  show(restruct: ReStruct, fragmentId: number, options: any): void {
    const render = restruct.render
    const fragment = restruct.molecule.frags.get(fragmentId)
    if (!fragment?.enhancedStereoFlag) return

    const position = fragment.stereoFlagPosition
      ? fragment.stereoFlagPosition
      : Fragment.getDefaultStereoFlagPosition(restruct.molecule, fragmentId)!

    const paper = render.paper
    const ps = scale.obj2scaled(position, options)

    const stereoFlagMap = {
      [StereoFlag.Abs]: options.absFlagLabel,
      [StereoFlag.And]: options.andFlagLabel,
      [StereoFlag.Mixed]: options.mixedFlagLabel,
      [StereoFlag.Or]: options.orFlagLabel
    }

    if (options.showStereoFlags) {
      this.#path = paper
        .text(
          ps.x,
          ps.y,
          fragment.enhancedStereoFlag
            ? stereoFlagMap[fragment.enhancedStereoFlag]
            : ''
        )
        .attr({
          font: options.font,
          'font-size': options.fontsz,
          fill: '#000'
        })
    }
    render.ctab.addReObjectPath(
      LayerMap.data,
      this.visel,
      this.#path,
      null,
      true
    )
  }
}

export default ReEnhancedFlag
