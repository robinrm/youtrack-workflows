/**
 * Copyright JetBrains s.r.o.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const entities = require('@jetbrains/youtrack-scripting-api/entities');
const workflow = require('@jetbrains/youtrack-scripting-api/workflow');

exports.rule = entities.Issue.onChange({
  title: 'Starte Timer wenn Ticket bearbeitet wird',
  guard: (ctx) => {
    return ctx.issue.fields.becomes(ctx.State, ctx.State.InProgress);
  },
  action: (ctx) => {
    ctx.issue.fields.Timer = Date.now();
    workflow.message("Timer gestartet.");
  },
  requirements: {
    Timer: {
      type: entities.Field.dateTimeType,
      name: 'Timer gestartet'
    },
    State: {
      type: entities.State.fieldType,
      InProgress: {
        name: 'Aktive Bearbeitung'
      }
    }
  }
});